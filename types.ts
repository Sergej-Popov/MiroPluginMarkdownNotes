export interface IMeta {
  isMarkdownNote: boolean;
  content: string;
  created: string;
  updated: string;
}

export interface IWidget {
  clientVisible: boolean;
  metadata: { [key: string]: IMeta };
}
