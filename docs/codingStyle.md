# Coding Style Guidelines

Here is a list of general guidelines to follow when contributing code to this project. Some of these are enforced by the build process while others are just suggestions, with plenty in between those 2 extremes.

## Code Linter

This project is setup with ESLint. All code must pass the linter prior to being merged. The linter will run automatically when building the project via `npm run build` and if the code does not pass the linter, the project will not be built or deployed.

Your IDE may have features that can display these error as you go so you can catch them early.

Things that got me early on with the linter:

- If you have an unused variable, the linter will throw an error unless you prefix it with `_`.
- All variables that are not changed must be declared as `const`.
- If you encounter an error you determine to be a false positive, add `@ts-expect-error` comment followed by the reason that error is safe to ignore/is expected. The linter is trying its best to encourage good practices and avoid common pit falls.
- No explicit variable types of `any`, use the safer `unknown` instead.
- React component props must be typed, this helps future you and others know what the component expects

## Code formatting

This project is setup with prettier for code formatting, while there is no automatic enforcement of this, it is highly recommended you use this prior to creating commits.

Your IDE may provide plugins to work with prettier automatically. If you need to run prettier on all the files, run `npx prettier . --write` on your command line.

## Code style

This list is not exhaustive by any means, please try to use your best judgement and follow good programming practices.

Following are some other guidelines to help keep the project consistent:

### Naming Conventions:

Most variables are named using `camelCase` while classes and types are `UpperCamelCase`. Global constants should be `ALL_CAPS`, but local constants (such as react state) should be `camelCase`. You may find things that are named differently as someone may have felt differently on that day, this will not be strictly enforced.

Use your best judgement when creating variable names. They should be descriptive and to the point of what they are and easily understood by future you and other contributors.

### Code modularity:

This project makes use of es modules to help break up the project into more manageable files. If you feel a file is getting too large, try breaking it up into smaller modules that are easier to manage, this is especially true for React components.

### Comments:

Try to write your code in a way such that it is readable without comments. Use comments where that may fail as well as to document where you are changing tasks.

Please try to document any functions at a minium with a brief description of what it does, what its parameters are/do and what its return value is. These kinds of comments are useful for others and future you for being told what a function does and how to use it.

### Functions:

Most functions in this project are written using the "arrow" syntax `()=>{}` instead of using the older `function(){}` style declarations, including with-in classes. This is not set in stone and can changed as required. I personally find arrow functions easier to understand with the way they handle `this`, but uses for standard functions may be desired for some use cases. For more details about why which function format we use matters, see [this MDN article about arrow functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions).

### Classes vs Objects:

This project uses a mix of object defined using the `Class` syntax as well as building up object literals that have the required functionality. There are benefits to both, but class declarations are preferred going forward for the following reasons:

- Classes also create a type that can be type checked and don't require an interface definition to be maintained as well for what is created
- Classes can be more intuitive than closures for newer developers
- In the end, both can obtain the same result, but classes should be easier to maintain

### Let vs Const vs Var:

Use `let` for variables that may change, if they never will change `const` must be used (or the linter gets upset). Using `let` and `const` instead of `var` can help avoid issues related to scoping and the availability of a variable. See [this MDN article on let](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let) for more details about the differences this brings.
