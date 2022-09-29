interface Person {
    name: string;
};

const bob = {
    name: 'Bob',
} as Person;
const bob2 = <Person>{
    name: 'Bob',
}