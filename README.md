# certificate-mini
小程序 - 在线题库

后端可以参考下 [xughv/cert](https://github.com/xughv/cert) 中的部分

```
数据返回格式
{
    code: 0,
    data: (JSON 数据)
}
```

[Category]:
```
_id: {
    type: Schema.Types.ObjectId,
},
name: {
    type: String,
}
```

[Chapter]:
```
_id: {
    type: Schema.Types.ObjectId,
},
name: {
    type: String,
},
categoryId: {
    type: Schema.Types.ObjectId,
},
```

[Problem]:
```
_id: {
    type: Schema.Types.ObjectId,
},
chapterId: {
    type: Schema.Types.ObjectId,
},
problem: {
    type: String,
},
choices: {
    type: Schema.Types.Mixed,
},
answer: {
    type: [String],
},
analysis: {
    type: String,
}
```

---

数据落地在 mongodb

![image](https://user-images.githubusercontent.com/14882240/31871750-53f956f8-b77c-11e7-8179-754ca15abbb8.png)

![image](https://user-images.githubusercontent.com/14882240/31871755-5ef4e996-b77c-11e7-821f-e05b26d2f9af.png)

![image](https://user-images.githubusercontent.com/14882240/31871734-42e4b07e-b77c-11e7-82bc-507d6ce06a6b.png)
