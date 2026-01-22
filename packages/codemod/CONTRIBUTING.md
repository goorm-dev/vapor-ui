# Contributing to @vapor-ui/codemod

Thanks for your interest in contributing to @vapor-ui/codemod! Your contributions help make our code migration tools better.

## How to Contribute

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

### Development Setup

1. Fork the Project
2. Clone your fork:
   ```bash
   git clone https://github.com/<YOUR_USERNAME>/vapor-ui.git
   cd vapor-ui
   ```

3. Install dependencies:
   ```bash
   pnpm install
   ```

4. Navigate to the codemod package:
   ```bash
   cd packages/codemod
   ```

### Making Changes

1. Create your Feature Branch:
   ```bash
   git checkout -b feature/AmazingFeature
   ```

2. Make your changes and test them:
   ```bash
   # Build the codemod
   pnpm build

   # Test on a sample project
   node bin/vapor-codemod.js <transform> <path>
   ```

3. Write or update tests:
   ```bash
   pnpm test
   ```

4. Commit your Changes using [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m 'feat(transform): Add some AmazingFeature'
   ```

   Common commit types:
   - `feat`: New transform or feature
   - `fix`: Bug fix in existing transform
   - `docs`: Documentation changes
   - `test`: Adding or updating tests
   - `refactor`: Code refactoring

5. Push to the Branch:
   ```bash
   git push origin feature/AmazingFeature
   ```

6. Open a Pull Request

### Adding New Transforms

When adding a new transform:

1. Create the transform file in `src/transforms/`
2. Add test fixtures in `__testfixtures__/` directory
3. Write tests to verify the transformation
4. Update the transform list in the CLI
5. Document the transform in README.md

Example transform structure:
```
src/transforms/
  internal/
    core/
      my-component/
        index.ts
        __testfixtures__/
          basic.input.tsx
          basic.output.tsx
        __tests__/
          my-component.test.ts
```

### Testing Guidelines

- Add both input and output fixtures for each test case
- Cover edge cases (no changes needed, complex nesting, etc.)
- Test with different file types (tsx, ts, jsx, js)
- Ensure transforms are idempotent (running twice produces same result)

### Code Quality

Before submitting:

1. Run tests:
   ```bash
   pnpm test
   ```

2. Build the package:
   ```bash
   pnpm build
   ```

3. Test on real-world code if possible

## Questions?

- Check the main [Vapor UI Contributing Guide](../../CONTRIBUTING.md)
- Open an [Issue](https://github.com/goorm-dev/vapor-ui/issues) for questions
- Contact: vapor.ui@goorm.io

## Code of Conduct

Please read and follow our [Code of Conduct](../../CODE_OF_CONDUCT.md).
