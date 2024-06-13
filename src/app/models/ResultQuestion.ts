import { RegionData } from "./RegionData";

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