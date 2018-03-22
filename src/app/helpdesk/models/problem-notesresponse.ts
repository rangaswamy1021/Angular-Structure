export interface IProblemNotesResponse {
    NoteId: string;
    ProblemId: string;
    LogType: string;
    LogDesc: string;
    UserName: string;
    WebDisplay: boolean;
    CreatedDate: Date;
    UserId: number;
}
