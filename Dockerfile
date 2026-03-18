FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate



RUN npm run build

#COPY wait-for-it.sh /wait-for-it.sh

EXPOSE 3000

CMD sh -c "npx prisma migrate deploy && npx prisma db seed && node dist/src/main.js"