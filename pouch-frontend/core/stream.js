// async streamEvents() {
//   const self = this;
  
//   this.setState({ rows: [] });

//   const response = await fetch(`http://localhost:5984/github-events/_design/by_org/_view/by_org?startkey=[${this.state.orgId}]&endkey=[${this.state.orgId}, {}]&include_docs=true`);

//   if (response.ok) {
//     const stream = response.body
//       .pipeThrough(new JSONStream('rows.*'));
    
//     const reader = stream.getReader();

//     (async function pump() {
//       const chunk = await reader.read();
      
//       if (!chunk.done) {
//         // console.log('chunk', chunk.value.doc);
//         self.setState({
//           rows: self.state.rows.concat([chunk.value.doc]),
//         });
//         pump();
//       } else {
        
//       }
//     })();
    
//   } else {
//     console.error('failed request', response.url, response.status, response.statusText);
//   }
// }