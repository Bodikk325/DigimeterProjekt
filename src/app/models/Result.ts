
import { RegionData } from "./RegionData"
import { ResultQuestion } from "./ResultQuestion"

export interface Result 
{
    compared_list : RegionData
    finalScore : number,
    id : string,
    resultType : string,
    time : string,
    results : ResultQuestion[]
}