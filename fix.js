function bubbleClass(type, parent, classname) {
  $(type + '.' + classname).parents(parent).first().addClass(classname);
}
