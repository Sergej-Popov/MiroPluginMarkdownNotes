import { formatISO } from "date-fns";
import config from "./config";
import { IMeta } from "./types";

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
      mn_doc_content: "Hello Vue!",
      saved: true,
      savingInProgress: false,
      editor: null,
      editing: false,
      colors: ["yellow", "green", "red", "blue", "black"],
      activeColor: null,
      notesContainer: null,
      widget: null
    },

    computed: {
      showClosingIcon: function () {
        return ["popup", "fullscreen"].includes(
          this.notesContainer?.toLowerCase()
        );
      },
      mn_doc_render: function () {
        return md.render(this.mn_doc_content);
      },
    },
    methods: {
      toggleEdit: async function () {
        this.editing = !this.editing;
      },
      close: async function (reason: string) {
        await miro.board.ui.closeLeftSidebar();
        await miro.board.ui.closeModal();
      },
      setColor: async function (color: string) {
        if (this.activeColor === color) {
          console.debug(this.widget);
        }

        this.widget.url = `${config.host}/img/journal-bookmark-${color}.svg`;
        this.widget.metadata[config.appId].color = color;
        this.activeColor = color;
        await miro.board.widgets.update(this.widget);
      },
      save: async function () {
        this.savingInProgress = true;
        try {
          const newContent = this.editor.getValue();

          this.widget.metadata[config.appId] = {
            ...this.widget.metadata[config.appId],
            content: newContent,
            updated: formatISO(new Date()),
          } as IMeta;

          await miro.board.widgets.update(this.widget);

          this.saved = true;
        } finally {
          this.savingInProgress = false;
        }
      },
      getWidget: function (selection: any) {
        if (selection?.length !== 1) return;
        const widget = selection[0];
        if (!widget?.metadata[config.appId]?.isMarkdownNote) return;

        return widget;
      },
      getMeta: function () {
        return this.widget.metadata[config.appId] as IMeta;
      },
      render: function (selection: any) {
        this.widget = this.getWidget(selection);
        this.activeColor = this.widget?.metadata[config.appId].color;

        if (!this.widget) {
          this.close();
        }

        this.meta = this.getMeta();
        this.editor.setValue(this.meta.content);
        this.saved = true;
        this.editor.selection.clearSelection();
        this.mn_doc_content = this.meta.content;
      },
    },
    mounted: async function () {
      this.editor = ace.edit("mn_doc_editor");
      this.editor.setTheme("ace/theme/github");
      this.editor.session.setMode("ace/mode/markdown");
      this.editor.renderer.setShowGutter(false);

      this.notesContainer = localStorage.getItem(
        config.storageKeys.settings.notesContainer
      );

      this.editor.on("change", (e: any) => {
        const current = this.editor.getValue();
        this.saved = false;
        this.mn_doc_content = current;
      });

      miro.addListener("SELECTION_UPDATED", (e: any) => {
        this.render(e.data);
      });
      const selection = await miro.board.selection.get();
      this.render(selection);
    },
  });
});
