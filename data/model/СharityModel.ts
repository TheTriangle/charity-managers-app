import {TagModel} from "./TagModel";

export interface CharityModel {
    name: string,
    briefDescription: string,
    description: string,
    url: string | null,
    address: string | null,
    tags: TagModel[],

}