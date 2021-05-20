import config from "./config";
import { IWidget } from "./types";

export const isMNWidget = (selection: any) => {
  if (Array.isArray(selection) && selection?.length !== 1) return false;
  const widget = Array.isArray(selection) ? selection[0] : selection;
  if (!widget?.metadata[config.appId]?.isMarkdownNote) return false;
  return true;
};

export const getAllNMWidgets = async (): Promise<IWidget[]> => {
  const allWidgets = await miro.board.widgets.get({ type: "image" });
  const filtered = allWidgets.filter(isMNWidget);
  return filtered;
};

