import type Store from 'electron-store';
export declare function _td(text: string): string;
declare type SubstitutionValue = number | string;
interface IVariables {
    [key: string]: SubstitutionValue | undefined;
    count?: number;
}
export declare function _t(text: string, variables?: IVariables): string;
declare type Component = () => void;
declare type TypedStore = Store<{
    locale?: string[];
}>;
export declare class AppLocalization {
    private static readonly STORE_KEY;
    private readonly store;
    private readonly localizedComponents?;
    constructor({ store, components }: {
        store: TypedStore;
        components: Component[];
    });
    private denormalize;
    fetchTranslationJson(locale: string): Record<string, string>;
    setAppLocale(locales: string | string[]): void;
    resetLocalizedUI(): void;
}
export {};
