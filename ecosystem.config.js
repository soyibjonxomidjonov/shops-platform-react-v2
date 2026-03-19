module.exports = {
  apps: [
    {
      name: 'shops-v2',
      script: '.next/standalone/server.js',
      cwd: '/home/ec2-user/shops-platform-react-v2',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '127.0.0.1'
      }
    }
  ]
};
