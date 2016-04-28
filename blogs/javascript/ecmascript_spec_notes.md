ECMAScript Specification Notes
===============================


# Object

所有对象都有一个内部槽位 [[Prototype]], 可以是 null 或者一个 Object, 用来实现继承. 子对象可以get其属性但不能set

所有对象都有一个称为 extensible 的内部槽位. 如果为 false, 则该对象不可添加新的属性, prototype 也将不可修改, 也不能将 extensible 属性再改回 true

cat $Filetemp | parallel --pipe 'sed -e "s/[[:space:]]\+/ /g"' > standard.txt
