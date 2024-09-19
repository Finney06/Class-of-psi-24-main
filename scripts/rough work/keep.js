// import fetch from 'node-fetch'



// Function to fetch user data from Airtable and send birthday messages
async function sendBirthdayMessages() {
    try {
      const airtableApiKey = 'patMBlQYlVo3H5wZU.5a353c102f5a4090215697499350e6d7bfcf285e61c3592e663cf6692a483fac';
      const baseId = 'appufz5VPar7viZy0';
      const tableName = 'tblmXStbPbBj88Z5E';
  
      const apiUrl = `https://api.airtable.com/v0/${baseId}/${tableName}`;
  
      fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${airtableApiKey}`
        }
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Error fetching data from Airtable');
          }
          return response.json();
        })
        .then(data => {
          // Process the retrieved data here
          const userInput = data.records.map(record => {
            const fields = record.fields;
            return {
              name: fields.Name,
              whatsappNumber: fields['Whatsapp Number'],
              nickname: fields.Nickname,
              dateOfBirth: fields['Date of Birth'],
              picture: fields.Picture && fields.Picture[0] && fields.Picture[0].url // Ensure Picture URL exists
            };
          });
  
          // Get today's date
          const today = new Date();
          const todayMonth = today.getMonth() + 1; // Month starts from 0, so add 1 to get the actual month
          const todayDay = today.getDate();
  
          // Iterate through course mates to find whose birthday it is today
          userInput.forEach(user => {
            // Extract month and day from the Date of Birth
            const dobMonth = user.dateOfBirth.split('-')[1];
            const dobDay = user.dateOfBirth.split('-')[2];
  
            // Extract whatsappNumber and picture from the user object
            const whatsappNumber = user.whatsappNumber;
            const picture = user.picture;
            const nickname = user.nickname;
            console.log(whatsappNumber)
  
             // Modify WhatsApp numbers
             const whatsappUsernameFormat = whatsappNumber.replace('+', '@'); // Replace '+' with '@'
             const whatsappNumberFormat = whatsappNumber.replace(/\D/g, ''); // Remove non-digit characters
             console.log(whatsappUsernameFormat);
             console.log(whatsappNumberFormat);
   
  
            // Check if the Date of Birth matches today's date
            if (parseInt(dobMonth) === todayMonth && parseInt(dobDay) === todayDay) {
              console.log(`Today is ${user.name}'s birthday!`);
  
               // Use Ultramsg API to send a WhatsApp message
               const ultramsgUrl = 'https://api.ultramsg.com/instance85495/messages/image';
               const ultramsgToken = 'yzu55mtpl80hys74'; // Replace with your actual Ultramsg token
   
               // Send message to individual user
               var myHeaders = new Headers();
               myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
   
               var individualBody = new URLSearchParams();
               individualBody.append("token", ultramsgToken);
               individualBody.append("to", whatsappNumber);
               individualBody.append("image", picture); // URL of the image
               individualBody.append("caption", `Happy Birthday, ${nickname}🎂🎉🎁!`); // Add a caption to the image
               individualBody.append("priority", "9");
               individualBody.append("referenceId", "");
               individualBody.append("nocache", "");
               individualBody.append("msgId", "");
               individualBody.append("mentions", "");
   
               var requestOptions = {
                 method: 'POST',
                 headers: myHeaders,
                 body: individualBody,
                 redirect: 'follow'
               };
   
               fetch(ultramsgUrl, requestOptions)
                 .then(response => response.text())
                 .then(result => console.log(result))
                 .catch(error => console.log('error', error));
  
                  // Send to WhatsApp group
              const groupBody = new URLSearchParams();
              groupBody.append("token", ultramsgToken);
              groupBody.append("to", "2347039600321-1611155720@g.us");
              groupBody.append("image", picture); // URL of the image
              groupBody.append("caption", `Happy Birthday, ${whatsappUsernameFormat}!`); // Add a caption to the image
              groupBody.append("priority", "10");
              groupBody.append("referenceId", "");
              groupBody.append("nocache", "");
              groupBody.append("msgId", "");
              groupBody.append("mentions", whatsappNumberFormat);
  
              const groupRequestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: groupBody,
                redirect: 'follow'
              };
  
              fetch(ultramsgUrl, groupRequestOptions)
                .then(response => response.text())
                .then(result => console.log(result))
                .catch(error => console.log('error', error));
             }
           });
         })
         .catch(error => {
           console.error('Error fetching data from Airtable:', error);
         });
     } catch (error) {
       console.error('Error:', error);
     }
   }
   
   sendBirthdayMessages();
  
  export { sendBirthdayMessages };