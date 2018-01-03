```javascript
    To call the info popup, please refer to the code below. If data is not present, url will be opened in the WebView. If the data is present, we will use the data to render a ListView.

    const payload = {
      title: 'Info Title',
      url: 'http://www.google.com',
      data: {
        first: [{
          key: 'Title1',
          value: 'Title2'
        },
        {
          key: 'Title2',
          value: 'Sub Title2'
        },
        {
          key: 'Title3',
          value: 'Sub Title3'
        },
        {
          key: 'Title4',
          value: 'Sub Title4'
        }],
        second: [{
          key: 'Title5',
          value: 'Sub Title5'
        },
        {
          key: 'Title6',
          value: 'Sub Title6'
        },
        {
          key: 'Title7',
          value: 'Sub Title7'
        },
        {
          key: 'Title8',
          value: 'Sub Title7'
        }]
      }
    };
    Actions.info({ data: payload , height: 400 });
```