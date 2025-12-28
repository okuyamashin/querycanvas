import * as fs from 'fs';
import * as path from 'path';

type TranslationKey = string;
type Translations = Record<string, any>;

/**
 * 国際化（i18n）マネージャー
 */
export class I18nManager {
    private translations: Translations;
    private locale: string;

    constructor(locale: string = 'en') {
        this.locale = locale.startsWith('ja') ? 'ja' : 'en'; // jaで始まる場合は日本語、それ以外は英語
        this.translations = this.loadTranslations();
    }

    /**
     * 翻訳ファイルを読み込み
     */
    private loadTranslations(): Translations {
        try {
            // コンパイル後はout/ディレクトリなので、out/i18n/を探す
            const filePath = path.join(__dirname, 'i18n', `${this.locale}.json`);
            console.log(`[I18nManager] Loading translations from: ${filePath}`);
            const content = fs.readFileSync(filePath, 'utf-8');
            const translations = JSON.parse(content);
            console.log(`[I18nManager] Successfully loaded ${this.locale} translations`);
            return translations;
        } catch (error) {
            console.error(`[I18nManager] Failed to load translations for ${this.locale}:`, error);
            // フォールバックとして英語を試す
            if (this.locale !== 'en') {
                try {
                    const fallbackPath = path.join(__dirname, 'i18n', 'en.json');
                    console.log(`[I18nManager] Trying fallback: ${fallbackPath}`);
                    const content = fs.readFileSync(fallbackPath, 'utf-8');
                    const translations = JSON.parse(content);
                    console.log(`[I18nManager] Successfully loaded fallback (en) translations`);
                    return translations;
                } catch (fallbackError) {
                    console.error('[I18nManager] Failed to load fallback translations:', fallbackError);
                    return {};
                }
            }
            return {};
        }
    }

    /**
     * 翻訳テキストを取得
     * @param key ドット区切りのキー（例: "connection.connect"）
     * @param params 置換パラメータ（例: {name: "DB名"}）
     */
    t(key: string, params?: Record<string, string | number>): string {
        const keys = key.split('.');
        let value: any = this.translations;

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return key; // キーが見つからない場合はキー自体を返す
            }
        }

        if (typeof value !== 'string') {
            return key;
        }

        // パラメータを置換
        if (params) {
            return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
                return params[paramKey]?.toString() || match;
            });
        }

        return value;
    }

    /**
     * すべての翻訳を取得（Webviewに渡す用）
     */
    getAllTranslations(): Translations {
        return this.translations;
    }

    /**
     * 現在のロケールを取得
     */
    getLocale(): string {
        return this.locale;
    }
}

