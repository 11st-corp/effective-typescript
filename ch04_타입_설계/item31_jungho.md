# 아이템31 타입 주변에 null 값 배치하기

[strictNullChecks](https://www.typescriptlang.org/tsconfig#strictNullChecks) 설정을 활성화 시키면, `null`이나 `undefined` 값에 관련된 오류들이 갑자기 발생한다.

따라서 오류를 회피하기 위해 null check하는 `if` 예외 처리 구문이 코드 전반에 추가 되어야 한다고 생각 할 수 있다. 

왜냐하면 만약 변수가 여러개면서 서로 종속되는 관계가 있는 변수가 있다면, 이러한 관계가 겉으로 드러나는 것이 아니기 때문에 개발자, 타입체커 모두에게 혼란스러워 타입만으로 어떤 변수가 `null`이 될 수 있는지 파악하기 어려워지기 때문이다.

<br/>

그러나, 값이 전부 `null`이거나 전부 `null`이 아닌 경우로 분명하게 구별될 수만 있다면 코드 작성이 훨씬 쉽다고 한다. 

이와 관련하여 타입에 `null`을 추가하는 방식을 사용할 수 있는데, 이 장에선 이를 어떻게 모델링하고 어떻게 사용했을 때  편리해 지는지 소개하고 있다.

<br/>

다음은 숫자들의 최소값과 최대값을 게산하는 extent 함수 예제이다.

```tsx
// 버그가 발생할 수 있는 코드
function extent(nums: number[]){
  let min, max;
  for (const num of nums){
    if(!min) {
      min = num;
      max = num;
    }
    else {
      min = Math.min(min, num);
      max = Math.max(max, num);
      // strictNullChecks 옵션을 키면 'number | undefined' 형식의 인수는 'number'형식에 할당할 수 없음을 알려줌
    }
  }
  return [min, max]; // (number | undefined)[]
}
// 배열에 0이 포함된다면, 의도치 않게 if(!min) 조건이 성립하고 값이 덧씌워져 버림
// nums 빈 배열이면 [undefined, undefined] 배열이 반환
// undefined를 포함하는 객체는 다루기 어렵기 때문에 권장하지 않음

// 해법
// min, max를 한 객체에 넣고 null 타입 체크
function extentFix(nums: number[]) {
  // 타입 주변에 null 값 배치
  let result: [number, number] | null = null; 
    for(const num of nums) {
      if(!result){
        result = [num, num];
      } else {
        result = [Math.min(num, result[0]), Math.max(num, result[1])];
      }
    }
  return result;
}
// 이제 반환 타입이 [number, number] | null
// null 단언 또는 if문을 통한 예외처리로 min, max값 추출 가능
```

<br/>

`null`과 `null`이 아닌 값을 혼재하여 사용하면 클래스에서도 문제가 발생한다.

예를 들어, 사용자와 그 사용자의 포럼 게시글을 나타내는 클래스가 있다고 가정해보자.

```tsx
class UserPosts {
  user: UserInfo | null;
  posts: Post[] | null;
  
  constructor(){
    this.user = null;
    this.posts = null;
  }

  async init(userId: string) {
    return Promise.all([  // 프로미스가 완료되지 않은 상태에서 user와 Post 상태는 null이게 된다.
      async () => this.user = await fetchUser(userId),
      async () => this.posts = await fetchPostUser(userId)
    ]);
  }
  
  getUser(){
    // ...
  }
}
```

시점에 따라 총 4가지 상태를 가질 수 있다. (`user`, `posts` 둘 다 `null`이거나 모두 `null`이 아니거나, 둘 중 하나만 `null`인 두 가지 상태)

속성 값의 불확실성이 클래스의 모든 메서드에 나쁜 영향을 미칠수 있다.

이를 방지하기 위해 `null` 체크가 난무하게 되고 가독성이 떨어지며 버그가 양산될 가능성을 높아진다.

<br/>

이를 개선하게 되면,

```tsx
class UserPostsFix {
  user: UserInfo;
  posts: Post[];

  constructor(user: UserInfo, posts: Post[]){
    this.user = user;
    this.posts = posts;
  }

  static async init(userId: string) : Promise<UserPostsFix> {
    const [user, posts] = await Promise.all([
      fetchUser(userId),
      fetchPostsForUser(userId)
    ]);

    return new UserPostsFix(user, posts);
  }

  getUserName() {
    return this.user.name;
  }
}
```

이제 UserPosts 클래스내 속성은 완전히 `null`이 아니게 되어, 메서드를 작성할 때 불확실성을 줄일 수 있다.

물론 이 또한, 데이터가 부분적으로 fetch되었을 때 무언가 작업해야 한다면, `null` 또는 `null`이 아닌 상태로 다루어야 하긴 한다.

<br/>

**요약**

- 한 값의 `null` 여부가 다른 값의 `null` 여부에 암시적으로 관련되도록 설계하는 것은 피해야한다.
- API 작성 시에는 반환 타입을 큰 객체로 만들고 반환 타입 전체가 `null`이거나 `null`이 아니게 만들어야 한다.
- 클래스를 만들 때는 필요한 모든 값이 준비되었을 때 생성하여 `null`이 존재하지 않도록 하는 것이 좋다.
- `strictNullChecks`를 설정하면 타입 오류가 많이 표시되겠지만, `null`값과 관련된 문제점 발견에 도움이 되므로 반드시 필요하다.