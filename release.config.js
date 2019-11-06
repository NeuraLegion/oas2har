module.exports = {
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        parserOpts: {
          noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES']
        },
        releaseRules: [
          {
            type: 'refactor',
            release: 'patch'
          }
        ]
      }
    ],
    [
      '@semantic-release/release-notes-generator',
      {
        writerOpts: {
          commitsSort: ['subject', 'scope']
        }
      }
    ],
    '@semantic-release/npm',
    '@semantic-release/github'
  ],
  branch: 'master',
  ci: true
};
