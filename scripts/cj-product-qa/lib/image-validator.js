/**
 * Image Validator - Check if image URLs are accessible
 */

const config = require('../config');

class ImageValidator {
  /**
   * Validate a single image URL
   */
  async validateUrl(url) {
    if (!url) {
      return { valid: false, error: 'No URL provided' };
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), config.AUDIT.IMAGE_TIMEOUT_MS);

      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const contentType = response.headers.get('content-type') || '';
      const isImage = contentType.startsWith('image/');

      return {
        valid: response.ok && isImage,
        status: response.status,
        contentType,
        isImage,
        error: response.ok ? null : `HTTP ${response.status}`,
      };
    } catch (error) {
      return {
        valid: false,
        error: error.name === 'AbortError' ? 'Timeout' : error.message,
      };
    }
  }

  /**
   * Validate all variant images for a product
   */
  async checkAllVariantImages(product) {
    const results = [];
    const variants = product.variants || [];

    for (const variant of variants) {
      const result = await this.validateUrl(variant.image);
      results.push({
        variant: variant.variant || variant.sku,
        url: variant.image,
        ...result,
      });
    }

    const validCount = results.filter(r => r.valid).length;
    const invalidCount = results.filter(r => !r.valid).length;

    return {
      results,
      summary: {
        total: results.length,
        valid: validCount,
        invalid: invalidCount,
        allValid: invalidCount === 0,
      },
    };
  }

  /**
   * Compare store image URLs with CJ image URLs
   */
  compareImages(storeVariants, cjVariants) {
    const comparisons = [];

    for (const storeVar of storeVariants) {
      // Try to find matching CJ variant by name similarity
      const cjMatch = cjVariants?.find(cv => {
        const cvName = (cv.variantNameEn || cv.name || '').toLowerCase();
        const svName = (storeVar.variant || '').toLowerCase();
        return cvName.includes(svName) || svName.includes(cvName);
      });

      comparisons.push({
        storeVariant: storeVar.variant,
        storeImage: storeVar.image,
        cjImage: cjMatch?.variantImage || cjMatch?.image,
        cjVariantName: cjMatch?.variantNameEn || cjMatch?.name,
        imagesMatch: storeVar.image === (cjMatch?.variantImage || cjMatch?.image),
      });
    }

    return comparisons;
  }
}

module.exports = ImageValidator;
