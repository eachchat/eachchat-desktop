interface Setting {
    read(): Promise<any>;
    write(value: any): Promise<void>;
}
export declare const Settings: Record<string, Setting>;
export {};
