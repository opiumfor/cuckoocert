### cuckooCert
SSL Certificates expiry notifications via Telegram

### Configuration

The following settings must be passed as environment variables.

| Key | Value |
| ------------- | ------------- |
| `EXPIRY_THRESHOLD` | Number of days before expiry for notifications to be sent |
| `BOT_TOKEN` | Telegram bot token |
| `CHAT_ID` | Telegram chat id |
| `SOCKS_USERNAME` | Socks-proxy username |
| `SOCKS_PASSWORD` | Socks-proxy password |
| `SOCKS_HOST` | Socks-proxy hostname or ip-address |
| `SOCKS_PORT` | Socks-proxy port |
| `DOMAIN_LIST_URI` | URI of a list of domains to monitor, one per line |
