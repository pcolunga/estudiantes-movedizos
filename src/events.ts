export enum MessageKind {
    PasteAbcInscriptionId,
    PasteAbcInscriptionStudent
}

export interface TabMessage {
    kind: MessageKind,
    payload: string
}
