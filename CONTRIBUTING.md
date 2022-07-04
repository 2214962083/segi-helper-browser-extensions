# 贡献

感谢您有兴趣为这个项目做出贡献！

## 开始

以下步骤将使您启动并运行并为 Segi helper browser extension 做出贡献：

1. Fork 这个仓库 (点击这个[页面](https://github.com/2214962083/segi-helper-browser-extensions)左上角的 <kbd>Fork</kbd> 按钮)

2. 克隆你的 fork 到本地

```sh
git clone https://github.com/<your_github_username>/segi-helper-browser-extensions.git
cd segi-helper-browser-extensions
```

3. 安装依赖项。这个项目依赖于 node v14+ 和 pnpm 6.x

如果你没有安装 pnpm，你应该执行：

```bash
npm i -g pnpm@6.32.17
```

安装依赖项：

```bash
pnpm i
```

启动项目（你可能需要先安装 chrome）：

```bash
pnpm start:chrome
```

### Commit 约定

在创建拉取请求之前，请检查您的提交是否符合此存储库中使用的提交约定。

当您创建提交时，我们恳请您遵守约定
`category(scope or module): message` 在您的提交消息中使用其中之一以下类别：

- `feat /feature`：引入全新代码或新代码的所有更改特征

- `fix`：修复错误的更改（理想情况下，您将另外引用问题（如果存在）

- `refactor`：任何与代码相关的更改，既不是修复也不是功能

- `docs`：更改现有文档或创建新文档（即 README、文档使用 lib 或 cli 使用）

- `build`：关于软件构建的所有更改，更改为依赖项或添加新的依赖项

- `test`：关于测试的所有更改（添加新测试或更改现有测试那些）

- `ci`：关于持续集成配置的所有更改（即 github 动作，ci 系统）

- `chore`：对存储库的所有更改不符合上述任何一项类别

如果您对详细规格感兴趣，可以访问
https://www.conventionalcommits.org/或查看
[Angular 提交消息指南](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#-commit-message-guidelines).

### 开始提交 pr

1. Fork segi-helper-browser-extensions 仓库，然后克隆你的

2. 从 `master` 分支创建一个新分支。 我们遵守 `[type/scope]` 约定。

   例如 `fix/share-tab-bug` 或 `feature/supports-global-search`。

   `type` 可以是 `docs`、`fix`、`feat`、`build` 或任何其他常规提交类型。

   `scope` 只是一个描述工作范围的简短 id。

3. 按照[提交约定](https://github.com/2214962083/segi-helper-browser-extensions/blob/master/CONTRIBUTING.md#commit-convention) 提交代码，并发起 pull request。

## 代码风格

只要安装了开发依赖项，就不用担心代码风格。 Git hooks 将在提交时为您格式化和修复它们。

## 致谢

再次感谢您对本项目感兴趣！你太棒了！

## License

通过将您的代码贡献给 segi-helper-browser-extensions GitHub 存储库，您将同意根据 MIT 许可许可您的贡献。
