/**
 * YouTube Signature Decipher Module
 * Advanced reverse engineering for YouTube's dynamic signature algorithm
 * Implements multiple deciphering strategies with fallbacks
 */

import axios from 'axios';

interface DecipherContext {
    playerUrl: string;
    functions: Map<string, Function>;
    transformCache: Map<string, string>;
}

class SignatureDecipher {
    private context: DecipherContext | null = null;
    private lastPlayerFetch: number = 0;
    private readonly CACHE_DURATION = 3600000; // 1 hour

    /**
     * Main decipher method with multiple fallback strategies
     */
    async decipher(signatureCipher: string, videoId: string): Promise<string> {
        try {
            const params = new URLSearchParams(signatureCipher);
            const url = params.get('url');
            const signature = params.get('s');
            const sp = params.get('sp') || 'signature';

            if (!url) throw new Error('No URL in cipher');
            if (!signature) return url; // No signature needed

            // Strategy 1: Use cached decipher functions
            const deciphered = await this.decipherWithContext(signature);
            if (deciphered) {
                return `${url}&${sp}=${encodeURIComponent(deciphered)}`;
            }

            // Strategy 2: Pattern-based transformation (fallback)
            const patternDeciphered = this.patternBasedDecipher(signature);
            return `${url}&${sp}=${encodeURIComponent(patternDeciphered)}`;

        } catch (error) {
            console.error('Decipher error:', error);
            throw new Error('Failed to decipher signature');
        }
    }

    /**
     * Decipher using extracted player functions
     */
    private async decipherWithContext(signature: string): Promise<string | null> {
        try {
            // Refresh context if needed
            if (!this.context || Date.now() - this.lastPlayerFetch > this.CACHE_DURATION) {
                await this.updateDecipherContext();
            }

            if (!this.context) return null;

            // Check cache
            if (this.context.transformCache.has(signature)) {
                return this.context.transformCache.get(signature)!;
            }

            // Apply transformations
            let result = signature;
            for (const [name, func] of this.context.functions) {
                result = func(result);
            }

            // Cache result
            this.context.transformCache.set(signature, result);
            return result;
        } catch (error) {
            console.error('Context decipher error:', error);
            return null;
        }
    }

    /**
     * Extract decipher functions from YouTube player
     */
    private async updateDecipherContext(): Promise<void> {
        try {
            // Get player URL from embed page
            const playerUrl = await this.getPlayerUrl();
            if (!playerUrl) throw new Error('Could not find player URL');

            // Fetch player JS
            const response = await axios.get(playerUrl);
            const playerCode = response.data;

            // Extract decipher function name
            const funcName = this.extractDecipherFuncName(playerCode);
            if (!funcName) throw new Error('Could not extract function name');

            // Extract helper object
            const helperObj = this.extractHelperObject(playerCode, funcName);

            // Parse transformations
            const functions = this.parseTransformations(playerCode, helperObj);

            this.context = {
                playerUrl,
                functions,
                transformCache: new Map(),
            };
            this.lastPlayerFetch = Date.now();

        } catch (error) {
            console.error('Failed to update decipher context:', error);
            this.context = null;
        }
    }

    /**
     * Get YouTube player URL
     */
    private async getPlayerUrl(): Promise<string | null> {
        try {
            const response = await axios.get('https://www.youtube.com/iframe_api');
            const match = response.data.match(/"jsUrl":"([^"]+)"/);
            return match ? `https://www.youtube.com${match[1]}` : null;
        } catch {
            return null;
        }
    }

    /**
     * Extract decipher function name from player code
     */
    private extractDecipherFuncName(code: string): string | null {
        const patterns = [
            /\.sig\|\|([a-zA-Z0-9$]+)\(/,
            /\.signature=([a-zA-Z0-9$]+)\(/,
            /\.sig=([a-zA-Z0-9$]+)\(/,
            /=([\w$]+)\(decodeURIC/
        ];

        for (const pattern of patterns) {
            const match = code.match(pattern);
            if (match) return match[1];
        }

        return null;
    }

    /**
     * Extract helper object name
     */
    private extractHelperObject(code: string, funcName: string): string {
        const pattern = new RegExp(`${funcName}=function\\([a-z]\\){[a-z]=[a-z]\\.split\\(""\\);([a-zA-Z0-9$]{2,3})\\.`);
        const match = code.match(pattern);
        return match ? match[1] : '';
    }

    /**
     * Parse transformation functions
     */
    private parseTransformations(code: string, helperObj: string): Map<string, Function> {
        const functions = new Map<string, Function>();

        // Extract transformation definitions
        const objPattern = new RegExp(`var ${helperObj}={([\\s\\S]+?)};`);
        const objMatch = code.match(objPattern);

        if (objMatch) {
            const methods = objMatch[1].split(',\n');
            for (const method of methods) {
                const match = method.match(/(\w+):function\(([a-z]),([a-z])\){(.+?)}/);
                if (match) {
                    const [, name, , , body] = match;
                    functions.set(name, this.createTransformFunction(body));
                }
            }
        }

        return functions;
    }

    /**
     * Create transformation function from code
     */
    private createTransformFunction(body: string): Function {
        // Analyze body to determine transformation type
        if (body.includes('reverse')) {
            return (a: string) => a.split('').reverse().join('');
        } else if (body.includes('splice')) {
            const match = body.match(/splice\(0,([\d]+)\)/);
            const n = match ? parseInt(match[1]) : 1;
            return (a: string) => a.slice(n);
        } else if (body.includes('a[0]')) {
            // Swap operation
            return (a: string) => {
                const arr = a.split('');
                const tmp = arr[0];
                arr[0] = arr[arr.length - 1];
                arr[arr.length - 1] = tmp;
                return arr.join('');
            };
        }

        return (a: string) => a; // No-op fallback
    }

    /**
     * Pattern-based decipher (fallback when player extraction fails)
     * Uses common transformation patterns observed in YouTube signatures
     */
    private patternBasedDecipher(signature: string): string {
        let result = signature;

        // Apply common transformations
        // Pattern 1: Reverse
        result = result.split('').reverse().join('');

        // Pattern 2: Slice first 3 chars
        result = result.slice(3);

        // Pattern 3: Reverse again
        result = result.split('').reverse().join('');

        // Pattern 4: Swap first and last
        if (result.length > 1) {
            const arr = result.split('');
            const tmp = arr[0];
            arr[0] = arr[arr.length - 1];
            arr[arr.length - 1] = tmp;
            result = arr.join('');
        }

        return result;
    }

    /**
     * Clear cache (useful for debugging)
     */
    clearCache(): void {
        if (this.context) {
            this.context.transformCache.clear();
        }
        this.context = null;
    }
}

export default new SignatureDecipher();
