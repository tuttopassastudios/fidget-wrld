/**
 * Description Rewriter - Uses Claude API to improve product descriptions
 */

const config = require('../config');

class DescriptionRewriter {
  constructor() {
    this.apiKey = config.getAnthropicKey();
    this.enabled = !!this.apiKey;

    if (!this.enabled) {
      console.log('   Note: ANTHROPIC_API_KEY not set, description rewrites disabled');
    }
  }

  /**
   * Strip HTML tags for comparison
   */
  stripHtml(html) {
    return (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  /**
   * Analyze current description quality
   */
  analyzeDescription(product) {
    const desc = this.stripHtml(product.description);
    const wordCount = desc.split(/\s+/).length;

    const issues = [];

    if (wordCount < 30) {
      issues.push('Too short (less than 30 words)');
    }
    if (wordCount > 300) {
      issues.push('May be too long (over 300 words)');
    }
    if (!desc.toLowerCase().includes('fidget')) {
      issues.push('Missing "fidget" keyword');
    }
    if (product.description?.includes('<p>1</p>')) {
      issues.push('Placeholder description detected');
    }
    if (desc.includes('&nbsp;') || desc.includes('&#')) {
      issues.push('Contains HTML entities');
    }

    return {
      wordCount,
      hasIssues: issues.length > 0,
      issues,
      needsRewrite: issues.length > 0 || wordCount < 50,
    };
  }

  /**
   * Generate improved description using Claude API
   */
  async improveDescription(product, cjData) {
    if (!this.enabled) {
      return {
        success: false,
        error: 'Claude API not configured',
        suggestion: null,
      };
    }

    try {
      const Anthropic = require('@anthropic-ai/sdk');
      const client = new Anthropic({ apiKey: this.apiKey });

      const prompt = `You are a copywriter for Fidget WRLD, a premium fidget toy e-commerce store.

Current product: ${product.name}
Current description:
${product.description}

CJ supplier product info:
- Name: ${cjData?.productNameEn || cjData?.name || 'N/A'}
- Material: ${cjData?.materialEn || 'Not specified'}
- Original description: ${this.stripHtml(cjData?.description || '').substring(0, 500)}

Target audiences: ${(product.audiences || []).join(', ') || 'all ages'}
Moods/Use cases: ${(product.moods || []).join(', ') || 'stress relief, focus'}
Category: ${product.category || 'Fidget Toy'}

Rewrite the description to be:
1. Compelling and benefit-focused (how it helps the user)
2. SEO-optimized with natural keywords (fidget, stress relief, anxiety, focus)
3. Appropriate for the target audience
4. 2-3 short paragraphs using <p> tags
5. Premium brand voice - fun but not childish
6. Include key features and what makes it special

Return ONLY the HTML description (just the <p> tags), no explanation or markdown.`;

      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      });

      const suggestion = response.content[0].text.trim();

      return {
        success: true,
        suggestion,
        analysis: this.analyzeDescription({ description: suggestion }),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        suggestion: null,
      };
    }
  }

  /**
   * Compare two descriptions
   */
  compareDescriptions(current, suggested) {
    const currentStripped = this.stripHtml(current);
    const suggestedStripped = this.stripHtml(suggested);

    return {
      currentWordCount: currentStripped.split(/\s+/).length,
      suggestedWordCount: suggestedStripped.split(/\s+/).length,
      significantChange: Math.abs(
        currentStripped.length - suggestedStripped.length
      ) > currentStripped.length * 0.3,
    };
  }
}

module.exports = DescriptionRewriter;
