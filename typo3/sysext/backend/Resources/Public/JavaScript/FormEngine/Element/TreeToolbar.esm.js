import Icons from '../../Icons.esm.js';
import $ from '../../../../../../core/Resources/Public/JavaScript/Contrib/jquery.esm.js';
import '../../Tooltip.esm.js';
import '../../SvgTree.esm.js';

var TreeToolbar = function () {
  this.settings = {
    toolbarSelector: ".tree-toolbar",
    collapseAllBtn: ".collapse-all-btn",
    expandAllBtn: ".expand-all-btn",
    searchInput: ".search-input",
    toggleHideUnchecked: ".hide-unchecked-btn"
  };
  this.$treeWrapper = null;
  this.tree = null;
  this._hideUncheckedState = false;
  this.$template = $("<div class=\"tree-toolbar btn-toolbar\">" + "<div class=\"input-group\">" + "<span class=\"input-group-addon input-group-icon filter\"></span>" + "<input type=\"text\" class=\"form-control search-input\" placeholder=\"" + TYPO3.lang["tcatree.findItem"] + "\">" + "</div>" + "<div class=\"btn-group\">" + "<button type=\"button\" data-toggle=\"tooltip\" class=\"btn btn-default expand-all-btn\" title=\"" + TYPO3.lang["tcatree.expandAll"] + "\"></button>" + "<button type=\"button\" data-toggle=\"tooltip\" class=\"btn btn-default collapse-all-btn\" title=\"" + TYPO3.lang["tcatree.collapseAll"] + "\"></button>" + "<button type=\"button\" data-toggle=\"tooltip\" class=\"btn btn-default hide-unchecked-btn\" title=\"" + TYPO3.lang["tcatree.toggleHideUnchecked"] + "\"></button>" + "</div>" + "</div>");
};
TreeToolbar.prototype.initialize = function (treeSelector, settings) {
  this.$treeWrapper = $(treeSelector);
  if (!this.$treeWrapper.data("svgtree-initialized") || typeof this.$treeWrapper.data("svgtree") !== "object") {
    this.$treeWrapper.on("svgTree.initialized", this.render.bind(this));
    return;
  }
  $.extend(this.settings, settings);
  this.render();
};
TreeToolbar.prototype.render = function () {
  var _this = this;
  this.tree = this.$treeWrapper.data("svgtree");
  var $toolbar = this.$template.clone().insertBefore(this.$treeWrapper);
  Icons.getIcon("actions-filter", Icons.sizes.small).then(function (icon) {
    $toolbar.find(".filter").append(icon);
  });
  Icons.getIcon("apps-pagetree-category-expand-all", Icons.sizes.small).then(function (icon) {
    $toolbar.find(".expand-all-btn").append(icon);
  });
  Icons.getIcon("apps-pagetree-category-collapse-all", Icons.sizes.small).then(function (icon) {
    $toolbar.find(".collapse-all-btn").append(icon);
  });
  Icons.getIcon("apps-pagetree-category-toggle-hide-checked", Icons.sizes.small).then(function (icon) {
    $toolbar.find(".hide-unchecked-btn").append(icon);
  });
  $toolbar.find(this.settings.collapseAllBtn).on("click", this.collapseAll.bind(this));
  $toolbar.find(this.settings.expandAllBtn).on("click", this.expandAll.bind(this));
  $toolbar.find(this.settings.searchInput).on("input", function () {
    _this.search.call(_this, this);
  });
  $toolbar.find(this.settings.toggleHideUnchecked).on("click", this.toggleHideUnchecked.bind(this));
  $toolbar.find("[data-toggle=\"tooltip\"]").tooltip();
};
TreeToolbar.prototype.collapseAll = function () {
  this.tree.collapseAll();
};
TreeToolbar.prototype.expandAll = function () {
  this.tree.expandAll();
};
TreeToolbar.prototype.search = function (input) {
  var _this = this;
  var name = $(input).val();
  this.tree.nodes[0].open = false;
  this.tree.nodes.forEach(function (node) {
    var regex = new RegExp(name, "i");
    if (regex.test(node.name)) {
      _this.showParents(node);
      node.open = true;
      node.hidden = false;
    } else {
      node.hidden = true;
      node.open = false;
    }
  });
  this.tree.prepareDataForVisibleNodes();
  this.tree.update();
};
TreeToolbar.prototype.toggleHideUnchecked = function () {
  var _this = this;
  this._hideUncheckedState = !this._hideUncheckedState;
  if (this._hideUncheckedState) {
    this.tree.nodes.forEach(function (node) {
      if (node.checked) {
        _this.showParents(node);
        node.open = true;
        node.hidden = false;
      } else {
        node.hidden = true;
        node.open = false;
      }
    });
  } else {
    this.tree.nodes.forEach(function (node) {
      node.hidden = false;
    });
  }
  this.tree.prepareDataForVisibleNodes();
  this.tree.update();
};
TreeToolbar.prototype.showParents = function (node) {
  if (node.parents.length === 0) {
    return true;
  }
  var parent = this.tree.nodes[node.parents[0]];
  parent.hidden = false;
  parent.open = true;
  this.showParents(parent);
};

export default TreeToolbar;
