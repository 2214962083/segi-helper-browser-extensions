## Git Commit 消息约定

> 这是改编自 [Angular 的提交约定](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-angular).

#### TL;DR:

消息必须与以下正则表达式匹配：

```text
/^(revert: )?(feat|fix|docs|dx|style|refactor|perf|test|workflow|build|ci|chore|types|wip)(\(.+\))?: .{1,50}/
```

#### 例子

出现在“Features”标题下，“link”子标题下：

```
feat(link): add `force` option
```

出现在 “Bug Fixes” 标题下，`view` 子标题下，带有指向问题 #28 的链接：

```
fix(view): handle keep-alive with aborted navigations

close #28
```

出现在 “Performance Improvements” 标题下，并在 “Breaking Changes” 下显示重大更改说明：

```
perf: improve guard extraction

BREAKING CHANGE: The 'beforeRouteEnter' option has been removed.
```

如果以下提交和提交 `667ecc1` 在同一版本下，则它们不会出现在更改日志中。如果没有，恢复提交将出现在 “Reverts” 标题下。

```
revert: feat(compiler): add 'comments' option

This reverts commit 667ecc1654a317a13331b17617d973392f415f02.
```

### 完整的消息格式

提交消息由 **header**、**body**和 **footer**组成。标头有 **type**、**scope**和 **subject**：

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

**header**是必需的，header 的 **scope**是可选的。

### Revert

如果提交恢复了先前的提交，它应该以 `revert: ` 开头，后跟恢复提交的标头。在正文中，它应该说：`This reverts commit <hash>.`，其中哈希是要恢复的提交的 SHA。

### Type

如果前缀是 `feat`、`fix` 或 `perf`，它将出现在更新日志中。但是，如果有任何 [BREAKING CHANGE](#footer)，提交将始终出现在更改日志中。

其他前缀由您自行决定。对于与变更日志无关的任务，建议的前缀是 `docs`、`chore`、`style`、`refactor` 和 `test`。

### Scope

范围可以是指定提交更改位置的任何内容。例如`core`、`compiler`、`ssr`、`v-model`、`transition`等...

### Subject

主题包含对更改的简洁描述：

-使用祈使语气，现在时：“change”不是“changed”也不是“changes” -第一个字母不要大写 -末尾没有点 (.)

### Body

就像在 **subject** 中一样，使用祈使式现在时：“change” 不是 “changed” 也不是 “changes”。
body 应该包括改变的动机，并将其与以前的行为进行对比。

### Footer

页脚应包含有关 **Breaking Changes** 的任何信息，同时也是参考此提交 **Closes** 的 GitHub 问题。

**Breaking Changes** 应以单词 `BREAKING CHANGE:` 开头，并带有一个空格或两个换行符。然后将提交消息的其余部分用于此目的。
