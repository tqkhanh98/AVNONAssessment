export interface Category {
    name: string;
    subCategoryList: SubCategory[];
    subTotals: number[];
}

export interface SubCategory {
    name: string;
    values: number[];
}