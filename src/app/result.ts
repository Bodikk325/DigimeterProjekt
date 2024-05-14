export interface ResultQuestion
{
    category : string,
    maxpoint : number,
    points : number,
    questionId : string,
    questionText : string,
    selectedAnswer : string[],
    selectedAnswerTexts: string[];
}


export interface Result 
{
    id : number,
    totalPoints : number,
    results : ResultQuestion[]
}