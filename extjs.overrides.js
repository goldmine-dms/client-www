// Ext.override(Ext.layout.FormLayout, {
//   renderItemOriginal: Ext.layout.FormLayout.prototype.renderItem,
//   renderItem: function(item, target, position) {
//     if (item && !item.rendered && item.isFieldLabelable && item.fieldLabel && item.allowBlank == false) {
//       item.fieldLabel += ' <span class="req" style="color:red">*</span>';
//     }
//     this.renderItemOriginal(arguments);
//   }
// });


Ext.apply(Ext.layout.FormLayout.prototype, {
  originalRenderItem:Ext.layout.FormLayout.prototype.renderItem,
  renderItem:function(c, position, target){
    if (c && !c.rendered && c.isFormField && c.fieldLabel
        && c.allowBlank === false) {
      c.fieldLabel += "<span class=\"required\"></span>";
    }
    this.originalRenderItem.apply(this, arguments);
    // Overriding the parent class list turned out to be a tad
    // difficult. Instead we manually call bubbleRequired which
    // adds the class 'required'
    bubbleClass('span', 'div', 'required');
  }
});
