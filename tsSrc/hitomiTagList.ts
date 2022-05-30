export interface TagType {
    language: string[];
    female: string[];
    male: string[];
    artist: string[];
    character: string[];
    series: string[];
    type: string[];
    tag: string[];
}

export interface TagList {
    includeTags: TagType;
    excludeTags: TagType;
}
