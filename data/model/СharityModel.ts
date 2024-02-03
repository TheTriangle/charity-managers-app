import {TagModel} from "./TagModel";

export interface CharityModel {
    address?: string | null;
    briefDescription: string;
    campaigns: string[];
    confirmed: boolean;
    creatorid: string;
    description: string;
    egrul: string;
    fullName: string;
    location: LocationModel | undefined;
    managerContact: string;
    name: string;
    organization: boolean;
    ogrn: string;
    photourl?: string | null;
    tags: TagModel[];
    url?: string | null;
}