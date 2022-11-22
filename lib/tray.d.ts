export declare function hasTray(): boolean;
export declare function destroy(): void;
interface IConfig {
    icon_path: string;
    brand: string;
}
export declare function create(config: IConfig): void;
export declare function initApplicationMenu(): void;
export {};
