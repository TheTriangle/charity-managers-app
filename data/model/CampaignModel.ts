import {TagModel} from "./TagModel";

export interface CampaignModel {
    id?: string
    yoomoney?: string,
    collectedamount: number
    parentcharity: string
    totalamount: number
    name: string
    tags?: TagModel[]
    confirmednotifications: boolean
    enddate?: string
}