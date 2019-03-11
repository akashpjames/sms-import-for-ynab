// export class Queue {
//     private items: any [];
//     constructor() {
//         this.items = new Array(20);
//     }
//
//     enqueue(element) {
//         if (this.items.length === 20) {
//             this.dequeue();
//         }
//         this.items.push(element);
//     }
//
//     dequeue() {
//         if (this.isEmpty())
//             return "No elements";
//         return this.items.shift();
//     }
//
//     isEmpty() {
//         return this.items.length === 0;
//     }
// }