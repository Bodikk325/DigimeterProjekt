import { RegionData } from "./result/result.component";

export interface ResultQuestion
{
    category : string,
    maxpoint : number,
    points : number,
    questionId : string,
    questionText : string,
    selectedAnswer : string[],
    selectedAnswerTexts: string[];
    textBoxAnswer? : string
    shownPoint : number,
    regionData : RegionData
}


export interface Result 
{
    compared_list : RegionData
    finalScore : number,
    id : string,
    resultType : string,
    time : number,
    results : ResultQuestion[]
}