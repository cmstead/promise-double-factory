<!--bl
(filemeta
    (title "Introduction"))
/bl-->

Promise Double Factory is a drop-in test solution for handling ES-Next and Promise/A+ promises in your code under test. The goal of Promise Double Factory is to make it as smooth and easy as possible to test code consuming promises without having to do a bunch of test gymnastics.

Why use Promise Double Factory:

- **Easy to use** -- API is exposed to developer to allow for full control over promise execution
- **Predictable** -- Executes promise code as it behaves in the wild, making it easier to verify everything works as expected
- **Deterministic execution** -- Your test is separated from the world: resolve or reject from within tests
- **Clear communication** -- Built to fail when code acts unpredictably: Resolve and reject throw when called twice; Optionally throws an error if no catch or onFailure behavior is registered (default: on)
- **Easy execution analysis** -- Optional step-by-step execution of resolve behavior for easier analysis

Compatibility:

- ES-Next Promise Standard:
    - Promise
        - all
        - race
        - new Promise()
    - Thenable
        - then
        - catch
        - finally
- Promise/A+
    - then supports both onSuccess and onFailure optionally


Promise Double Factory works both in Node and client-side code, so it integrates seamlessly into all of your test scenarios. With its clear, simple API, it is easy to either execute through the entire code stack or perform step-by-step evaluation of promise resolution.