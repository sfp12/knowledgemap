20150110 knowledge_map修改的地方：
1、dialog的调整。把结构图中的dialog（另存，新建知识点）调整到全局中（我的列表，knowledge_map_js_showKnowledgeMapListCode），相应的js也移过来，增加ksmid和dblclick_sign两个全局变量。dialog js中的增加局部变量。
更新table时，移除四个dialog，关闭我的列表时，也移除；
2、知识点-确定之前的判断：1、没有内容，提示，2、有内容，但不在ksname中，提示，3、可以改变
3、去掉了dblclick_sign。还是要做单击和双击独立。只是在双击之后，把click_sign=0。
4、在knowledge_map_js_newKnowledgeMapJs中，click事件需要unbind。
5、不用getComment()：打开结构图时，从列表中提取
6、dialog不要通过option，传递数据，用局部变量就好。现在是全局变量
7、knowledge_map_js_JSONAndSave 和 knowledge_map_js_JSONAndUpdate中需要加knowledge_map.nodes_pid = [];
8、根节点的父节点设为-1
9、新建的保存，关掉，再打开新的；重画的保存，重画新的；另存的不变。
10、dialog的open加了捕获enter按键的方法。
