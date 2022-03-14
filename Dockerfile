FROM node:16
WORKDIR /dspfront
COPY package*.json ./
RUN npm i @vue/cli-service
RUN npm install --production
COPY . .
RUN npm uninstall sharp
RUN npm install --arch=x64 --platform=linux sharp
RUN npm run build
EXPOSE 5001
CMD ["npm", "run", "serve", "--", "--port", "5001", "--host", "dspfront"]
