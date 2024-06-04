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
    id : string,
    resultType : string,
    time : number,
    results : ResultQuestion[]
}