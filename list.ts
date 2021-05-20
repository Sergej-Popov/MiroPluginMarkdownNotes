import { formatDistance, parseISO } from "date-fns";
import FileSaver from "file-saver";
import config from "./config";
import { IWidget } from "./types";
import { getAllNMWidgets } from "./utils";

// todo: move to factory
const md = new markdownit({
  highlight: function (str: string, lang: string) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value;
      } catch (__) {}
    }

    return ""; // use external default escaping
  },
});

miro.onReady(() => {
  new Vue({
    el: "#mn_app",
    data: {
      widgets: [],
      hidden: false,
      settings: false,
      notesContainer: null,
    },
    watch: {
      notesContainer(val: string, old: string) {
        localStorage.setItem(config.storageKeys.settings.notesContainer, val);
      },
    },
    computed: {
      mn_doc_render: function () {
        return md.render(this.mn_doc_content);
      },
    },
    methods: {
      exportAll: async function (widget: IWidget) {
        const allWidgets = await getAllNMWidgets();

        allWidgets.forEach((widget, index) => {
          const blob = new Blob([widget.metadata[config.appId].content], {
            type: "text/markdown",
          });
          FileSaver.saveAs(blob, `markdown-notes-${index}.md`);
        });
      },
      focus: async function (widget: IWidget) {
        await miro.board.viewport.zoomToObject(widget);
        await miro.board.selection.selectWidgets(widget);
      },
      toggleVisibility: async function () {
        const allWidgets = await getAllNMWidgets();
        allWidgets.forEach((s: IWidget) => {
          s.clientVisible = this.hidden;
        });
        this.hidden = !this.hidden;
        await miro.board.widgets.update(allWidgets);
        console.log(allWidgets);
      },
      getLastUpdated: function (widget: IWidget) {
        const meta = widget.metadata[config.appId];
        return formatDistance(parseISO(meta.updated), new Date(), {
          addSuffix: true,
        });
      },
      getPreview: function (widget: IWidget) {
        const meta = widget.metadata[config.appId];
        const firstLines = meta.content.split("\n").slice(0, 3).join("\n");
        return md.render(firstLines);
      },
    },
    mounted: async function () {
      this.widgets = await getAllNMWidgets();
      this.notesContainer = localStorage.getItem(config.storageKeys.settings.notesContainer);

      miro.addListener("CANVAS_CLICKED", (e: any) => {
        miro.board.ui.closeLeftSidebar();
      });
    },
  });
});
