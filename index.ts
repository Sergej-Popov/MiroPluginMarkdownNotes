import { formatISO } from "date-fns";
import config from "./config";
import icons from "./icons";
import { IMeta } from "./types";

miro.onReady(() => {

  miro.addListener("SELECTION_UPDATED", (event: any) => {
    if (event?.data?.length !== 1) return;
    const widget = event.data[0];
    if (!widget?.metadata[config.appId]?.isMarkdownNote) return;

    miro.board.ui.openLeftSidebar("sidebar.html", { width: 400 });
  });

  miro.initialize({
    extensionPoints: {
      toolbar: {
        title: "Markdown Note",
        librarySvgIcon: icons.journal_plus,
        toolbarSvgIcon: icons.journal_plus,
        onClick: async () => {
          // todo: getViewport is deprecated. Should use .get() instead. But it has a bug: when side bar open, gives negative width.
          const viewport = await miro.board.viewport.getViewport();
          const x = viewport.width / 2 + viewport.x;
          const y = viewport.height / 2 + viewport.y;

          const now = formatISO(new Date());
          
          const imgProp = {
            type: "image",
            url: `${config.host}/img/journal-bookmark-black.svg`,
            metadata: {
              [config.appId]: {
                isMarkdownNote: true,
                content: "# Hello Markdown",
                created: now,
                updated: now,
                color: "black"
              } as IMeta,
            },
            x,
            y,
          };

          const widget = await miro.board.widgets.create(imgProp);
          console.log("CREATED", widget);
          miro.board.selection.selectWidgets(widget);
        },
      },
      bottomBar: {
        title: "Markdown Notes",
        svgIcon: icons.journal_text,
        onClick: async () => {
          miro.board.ui.openLeftSidebar("list.html", { width: 400 });
        },
      },
    },
  });
});
