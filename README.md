# Stol (Universal Online Storage Tool)

Stol  is an Universal Online Storage Tool written in Vanilla Node.js (for backend), HTML\CSS (for frontend)  and MongoDB (for databases) that integrates the three biggest storage tools APIs (Google Drive, Microsoft OneDrive and Dropbox) in a single application. When a user uploads a large file, it is split into multiple parts and uploaded to each of the storage tools linked to the account. The when downloading the uploaded file, the app assures safe file recomposition.

## Run the server yourself

This server can be run using the basic command for running a Node.js server

```bash
node index.js
```
## Upload and Download Implementation
It is worth noting that this app can upload and download files at a very high speed as each of the parts of the split file are uploaded and downloaded asynchronously (as opposed to sequentially downloading\uploading each file part).
It takes full advantage of the event-driven Node.js to make sure that no matter in what order the files are downloaded to the server, the file is always recomposed in the correct order. Checksums are also used to verify the integrity of the recomposed file
## App photos

▪ The Login Page:

![image info](./presentation/userGuide/images/loginPage.png)

▪The Home Page:

![image info](./presentation/userGuide/images/homePage.png)

▪ How to link your account to online storage tools:

![image info](./presentation/userGuide/images/myaccount.png)


## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure updates are appropriate.
