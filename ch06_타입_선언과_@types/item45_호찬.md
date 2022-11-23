# 아이템 45. devDependencies에 typescript와 @types 추가하기

### package.json

- `dependencies`
  - : 프로젝트를 npm에 공개하여 다른 사용자가 해당 프로젝트를 설치한다면, `dependencies`의 라이브러리가 같이 설치
- `devDependencies`
  - : 프로젝트를 npm에 공개하여 다른 사용자가 해당 프로젝트를 설치한다면, `devDependencies`의 라이브러리는 제외하고 설치
- `peerDependencies`
  - : 런타임에 필요하긴 하지만, 의존성을 직접 관리하지 않는 라이브러리만 포함

타입스크립트 프로젝트에서 공통적으로 고려해야 할 사항 두가지는 아래와 같다.

#### 타입스크립트 자체 의존성을 고려해야 한다.

팀원들 모두가 항상 동일한 버전을 설치한다는 보장이 있어야 한다. 따라서 `typescript`를 시스템 레밸에서 사용하는 것보다는 `devDependencies`에 넣는 것이 적합하다. 또, `npx`를 사용해서 `devDependencies`를 통해 설치된 타입스크립트 컴파일러를 실행할 수 있다.

```bash
npx tsc
```

#### 타입 의존성(@types)을 고려해야 한다.

라이브러리에 타입 선언이 포함되엉 있지 않더라도, DefinitelyTyped에서 타입 정보를 얻을 수 있다.

```bash
npm install react
npm install --save-dev @types/react
```

`package.json`

```json
{
  "devDependencies": {
    "@types/react": "^16.8.19",
    "typescript": "^3.5.3",
  },
  "dependencies": {
    "react": "^16.8.6",
  }
}
```

### 요약

- 타입스크립트를 시스템 레밸로 설치하는 것보다, 프로젝트의 devDependencies에 포함시키고 팀원 모두가 동일한 버전을 사용하도록 하자.
- @types 의존성은 devDependencies에 포함시켜야한다. 런타입에 @types가 필요한 경우라면 별도의 작업이 필요할 수 있다.
