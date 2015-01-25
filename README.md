介绍：实现一个概念图的功能。版本一：Java+sql server;版本二：nodejs+mongodb。klm_practice，knowledge_map是版本一种的前端js，klm是版本二的后端js。
技术：sql server，hibernate，jquery UI，jsPlumb；nodejs，mongodb。
功能：新建一个结构图（dialog），从工具框中拖出一个节点（drag，drop）。可以修改节点的名字（dialog），给节点加笔记，删除节点，节点间连线（jsplumb）。存入数据库，重新打开，可以保存和另存。
学到的东西：
1、删除元素，添加元素，再添加事件时，要注意unbind之前加的事件
2、dialog destroy会删掉jquery UI添加的dialog元素，remove是删除自己写的元素。


现在总结时，很多细节都记不太清，当时都记在博客中了。
