import $ from '../../../../core/Resources/Public/JavaScript/Contrib/jquery.esm.js';

DragDrop = {
  dragID: null,
  table: null
};
DragDrop.dragElement = function (event, $element) {
  event.preventDefault();
  var $container = $element.parent().parent();
  var elementID = $container.prop("id");
  elementID = elementID.substring(elementID.indexOf("_") + 1);
  DragDrop.dragID = DragDrop.getIdFromEvent(event);
  if (!DragDrop.dragID) {
    return false;
  }
  if (!elementID) {
    elementID = DragDrop.dragID;
  }
  if ($("#dragIcon").length === 0) {
    $("body").append("<div id=\"dragIcon\" style=\"display: none;\">&nbsp;</div>");
  }
  $("#dragIcon").html($container.find(".dragIcon").html() + $container.find(".dragTitle").children(":first").text());
  document.onmouseup = function (event) {
    DragDrop.cancelDragEvent(event);
  };
  document.onmousemove = function (event) {
    DragDrop.mouseMoveEvent(event);
  };
};
DragDrop.dropElement = function (event) {
  var dropID = DragDrop.getIdFromEvent(event);
  if (DragDrop.dragID && DragDrop.dragID !== dropID) {
    var dragID = DragDrop.dragID;
    var table = DragDrop.table;
    var parameters = "table=" + table + "-drag" + "&uid=" + dragID + "&dragDrop=" + table + "&srcId=" + dragID + "&dstId=" + dropID;
    require(["TYPO3/CMS/Backend/ContextMenu"], function (ContextMenu) {
      ContextMenu.record = {
        table: decodeURIComponent(table),
        uid: decodeURIComponent(dragID)
      };
      ContextMenu.fetch(parameters);
    });
  }
  DragDrop.cancelDragEvent();
  return false;
};
DragDrop.cancelDragEvent = function (event) {
  DragDrop.dragID = null;
  if ($("#dragIcon").length && $("#dragIcon").is(":visible")) {
    $("#dragIcon").hide();
  }
  document.onmouseup = null;
  document.onmousemove = null;
};
DragDrop.mouseMoveEvent = function (event) {
  if (!event) {
    event = window.event;
  }
  $("#dragIcon").css({
    left: event.x + 5 + "px",
    top: event.y - 5 + "px"
  }).show();
};
DragDrop.getIdFromEvent = function (event) {
  var obj = event.currentTarget;
  while (obj.id == false && obj.parentNode) {
    obj = obj.parentNode;
  }
  return obj.id.substring(obj.id.indexOf("_") + 1);
};
Tree = {
  ajaxRoute: "sc_alt_file_navframe_expandtoggle",
  frameSetModule: null,
  activateDragDrop: true,
  highlightClass: "active",
  pageID: 0,
  noop: function () {},
  load: function (params, isExpand, obj, scopeData, scopeHash) {
    var $obj = $(obj);
    var $parentNode = $(obj).parent().parent();
    if (!isExpand) {
      $parentNode.find("ul:first").remove();
      var $pm = $obj.parent().find(".pm:first");
      if ($pm.length) {
        $pm.get().onclick = null;
        var src = $pm.children(":first").prop("src");
        src = src.replace(/minus/, "plus");
        $pm.children("first").prop("src", src);
      }
    } else {
      $obj.css({
        cursor: "wait"
      });
    }
    $.ajax({
      url: TYPO3.settings.ajaxUrls[this.ajaxRoute],
      data: {
        PM: params,
        scopeData: scopeData,
        scopeHash: scopeHash
      }
    }).done(function (data) {
      $parentNode.replaceWith(data);
      Tree.reSelectActiveItem();
    });
  },
  refresh: function () {
    var r = new Date();
    var loc = window.location.href.replace(/&randNum=\d+|#.*/g, "");
    var addSign = loc.indexOf("?") > 0 ? "&" : "?";
    window.location = loc + addSign + "randNum=" + r.getTime();
  },
  registerDragDropHandlers: function () {
    if (!Tree.activateDragDrop) {
      return;
    }
    $(".list-tree-root").on("mousedown", ".dragTitle, .dragIcon", function (evt) {
      DragDrop.dragElement(evt, $(this));
    }).on("mouseup", ".dragTitle, .dragIcon", function (evt) {
      DragDrop.dropElement(evt, $(this));
    });
  },
  reSelectActiveItem: function () {
    if (!top.fsMod) {
      return;
    }
    var $activeItem = $("#" + top.fsMod.navFrameHighlightedID[this.frameSetModule]);
    if ($activeItem.length) {
      $activeItem.addClass(Tree.highlightClass);
      Tree.extractPageIdFromTreeItem($activeItem.prop("id"));
    }
  },
  highlightActiveItem: function (frameSetModule, highlightID) {
    Tree.frameSetModule = frameSetModule;
    Tree.extractPageIdFromTreeItem(highlightID);
    var $obj = $("#" + top.fsMod.navFrameHighlightedID[frameSetModule]);
    if ($obj.length) {
      $obj.removeClass(Tree.highlightClass);
    }
    top.fsMod.navFrameHighlightedID[frameSetModule] = highlightID;
    $("#" + highlightID).addClass(Tree.highlightClass);
  },
  extractPageIdFromTreeItem: function (highlightID) {
    if (highlightID) {
      Tree.pageID = highlightID.split("_")[0].substring(5);
    }
  }
};
document.addEventListener("typo3:filelist:treeUpdateRequested", evt => {
  var identifier = evt.detail.payload.identifier;
  if (top.fsMod && top.fsMod.currentBank) {
    identifier += "_" + top.fsMod.currentBank;
  }
  Tree.highlightActiveItem("file", identifier);
});
var Tree$1 = Tree;

export default Tree$1;
