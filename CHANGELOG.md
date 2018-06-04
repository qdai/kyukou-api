# API Change Log

### Note

[Please refer to the releases page as of version 3.0.0](https://github.com/qdai/kyukou-api/releases).

## Version 2.1.1 (2017-11-05)

- Bug Fixes
  - [[`44b5ab3f91`](https://github.com/qdai/kyukou-api/commit/44b5ab3f91)] Fix log.level (#56).
- Dependency Updates
  - [[`ee275c9fcc`](https://github.com/qdai/kyukou-api/commit/ee275c9fcc)] Chore(package): update @egy186/eslint-config to version 0.27.0 (#45).
  - [[`30d68f257a`](https://github.com/qdai/kyukou-api/commit/30d68f257a)] Chore(package): update @egy186/eslint-config to version 0.28.0 (#49).
  - [[`824b2e01d3`](https://github.com/qdai/kyukou-api/commit/824b2e01d3)] Chore(package): update mocha to version 4.0.0 (#52).
  - [[`c5084e2a39`](https://github.com/qdai/kyukou-api/commit/c5084e2a39)] Chore(package): update @egy186/eslint-config to version 0.29.0 (#54).
  - [[`52bddb5689`](https://github.com/qdai/kyukou-api/commit/52bddb5689)] Chore(package): update eslint to version 4.10.0 (#55).

## Version 2.1.0 (2017-08-04)

- Features
  - [[`3606bfe130`](https://github.com/qdai/kyukou-api/commit/3606bfe130)] Support graduate school.
- Bug Fixes
  - [[`22683e2274`](https://github.com/qdai/kyukou-api/commit/22683e2274)] Test node v7 in ci (#25).
  - [[`930d192108`](https://github.com/qdai/kyukou-api/commit/930d192108)] Enable useMongoClient option (#44).
  - [[`9a13274b5f`](https://github.com/qdai/kyukou-api/commit/9a13274b5f)] Test in latest node.
- Dependency Updates
  - [[`308f8e28ee`](https://github.com/qdai/kyukou-api/commit/308f8e28ee)] Update dependencies to enable Greenkeeper (#26).
  - [[`1d6e4e808f`](https://github.com/qdai/kyukou-api/commit/1d6e4e808f)] Update mongoose to version 4.10.0 (#36).
  - [[`fc5363e524`](https://github.com/qdai/kyukou-api/commit/fc5363e524)] Update eslint to the latest version (#39).
  - [[`3e502beb4e`](https://github.com/qdai/kyukou-api/commit/3e502beb4e)] Update chai to the latest version (#37).
  - [[`b696a0350e`](https://github.com/qdai/kyukou-api/commit/b696a0350e)] Chore(package): update @egy186/eslint-config to version 0.26.0 (#42).
  - [[`866202c5ce`](https://github.com/qdai/kyukou-api/commit/866202c5ce)] Chore(package): update eslint to version 4.3.0 (#43).

## Version 2.0.2 (2016-11-14)

- Bug Fixes
  - [[`1316a908ed`](https://github.com/qdai/kyukou-api/commit/1316a908ed)] Fix subject in eventasstring.
  - [[`6ef4b47092`](https://github.com/qdai/kyukou-api/commit/6ef4b47092)] Fix unhandled promise rejection in test.
- Dependency Updates
  - [[`f46c6e6069`](https://github.com/qdai/kyukou-api/commit/f46c6e6069)] Update mocha to version 2.5.1 (#10).
  - [[`5ebd219ebc`](https://github.com/qdai/kyukou-api/commit/5ebd219ebc)] Update eslint to version 2.12.0.
  - [[`d613d7a5e1`](https://github.com/qdai/kyukou-api/commit/d613d7a5e1)] Update eslint to version 3.0.1 (#13).
  - [[`3646e0e041`](https://github.com/qdai/kyukou-api/commit/3646e0e041)] Update mocha to version 3.0.2 (#16).
  - [[`6ff74aed40`](https://github.com/qdai/kyukou-api/commit/6ff74aed40)] Update mongoose to version 4.6.0 (#18).
  - [[`b526fe05f9`](https://github.com/qdai/kyukou-api/commit/b526fe05f9)] Update twit to v2.2.4 (#19).
  - [[`edf4e5e22e`](https://github.com/qdai/kyukou-api/commit/edf4e5e22e)] Update eslint to v3.5.0 (#20).
  - [[`3d622be501`](https://github.com/qdai/kyukou-api/commit/3d622be501)] Update chai-as-promised to version 6.0.0 (#21).
  - [[`bd4a035ba8`](https://github.com/qdai/kyukou-api/commit/bd4a035ba8)] Update eslint to v3.9.1 (#24).
  - [[`3de146aa14`](https://github.com/qdai/kyukou-api/commit/3de146aa14)] Update mongoose to version 4.6.6 (#22).

## Version 2.0.1 (2016-04-09)

- Bug Fixes
  - [[`efdd4f4ae6`](https://github.com/qdai/kyukou-api/commit/efdd4f4ae6)] Avoid status duplicate in test case.
  - [[`291c66c7a6`](https://github.com/qdai/kyukou-api/commit/291c66c7a6)] Add `files` field to package.json.
- Dependency Updates
  - [[`1bbef46ba3`](https://github.com/qdai/kyukou-api/commit/1bbef46ba3)] Use eslint-config-egy186.
  - [[`58cd208534`](https://github.com/qdai/kyukou-api/commit/58cd208534)] Update eslint to version 2.2.0.
  - [[`0a1e35ad05`](https://github.com/qdai/kyukou-api/commit/0a1e35ad05)] Update moment to version 2.12.0.

## Version 2.0.0 (2015-12-18)

- Breaking Changes
  - [[`3eaed15583`](https://github.com/qdai/kyukou-api/commit/3eaed15583)] Use class expression and rename APIs.
  - [[`700fa98e7c`](https://github.com/qdai/kyukou-api/commit/700fa98e7c)] Rename `tasks.task` to `tasks.scrap` and separate scraper.
  - [[`792bfa9da5`](https://github.com/qdai/kyukou-api/commit/792bfa9da5)] Update tweeted event.
- Features
  - [[`ff375541da`](https://github.com/qdai/kyukou-api/commit/ff375541da)] Adds an instance method asString to Event schema.
  - [[`1f07e0d0d2`](https://github.com/qdai/kyukou-api/commit/1f07e0d0d2)] Check tweet length.

## Version 1.1.0 (2015-07-11)

- Features
  - [[`05b074af56`](https://github.com/qdai/kyukou-api/commit/05b074af56)] `events/list` can now specify department.
