module.exports = {
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        parserOpts: {
          noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES']
        },
        releaseRules: [
          {type: 'refactor', release: 'patch'}
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
    [
      '@semantic-release/github',
      {
        assets: ['dist/**', 'src/**', 'package.json', 'package-lock.json', 'README.md']
      }
    ],
    [
      '@semantic-release/git', {
      assets: ['src/**', 'package.json', 'package-lock.json'],
      message: 'chore(release): ${nextRelease.version} [skip ci]'
    }
    ]
  ],
  branch: 'master',
  ci: true
};
