# I. REQUIREMENTS

1. Yarn
2. Node (version >=16)
3. Docker
4. Docker Compose

# II. DEVELOPMENT

1. Copy all .env.dev to .env for development

```
cp api/.env.dev api/.env && cp lib/.env.dev lib/.env
```

2. Install dependencies

```
yarn
```

3. Start docker-compose

```
yarn up
```

4. Docker services:

- If docker-compose failed to start, check if redis and postgresql db is running outside of docker container and kill them
- postgresql: localhost:5432 #secret in docker-compose.yml
- pgadmin4: localhost:5050 #secret in docker-compose.yml
- redis: 6379

5. Create DB

- Goto http://localhost:5050 and login to pgadmin
- Run query with file `api/db/schema.sql`
- Go to lib run npx prisma db pull

6. Build lib

```
yarn lib
```

7. Start all services

```
yarn start
```

8. Develope separate module

```
yarn api     # to start api
yarn admin   # to start admin
yarn crawler # to start crawler
```

9. Check all package.json and docker-compose.yml for more information and commands

https://docs.timescale.com/timescaledb/latest/how-to-guides/configuration/docker-config/#edit-the-postgresql-configuration-file-inside-docker
Increase shared_buffers
Increase max_connection

10. Khi deploy server sẽ check xem server đó cài ubuntu desktop hay ubuntu server, nếu là server thì argument khi chạy phải là chromium trong file .env crawlerFacebook
    nhớ cài chromium browser với lệnh "sudo apt-get install chromium-browser" nếu chưa có
