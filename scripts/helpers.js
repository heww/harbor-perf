
import harbor from 'k6/x/harbor'
import { sleep } from 'k6'

export function fetchAritfacts(projectName, repositoryName, count=-1) {
    let page = 1
    const pageSize = 100

    const results = []
    while (true) {
        const { artifacts } = harbor.listArtifacts(projectName, repositoryName, { page, pageSize })

        for (const artifact of artifacts) {
            results.push(artifact)
        }

        if (artifacts.length == 0 || artifacts.length < pageSize) {
            break
        }

        if (count > 0 && results.length >= count) {
            break
        }

        page++
    }

    if (count > 0) {
        return results.slice(0, count)
    }

    return results
}

export function fetchProjects(count=-1) {
    let page = 1
    const pageSize = 100

    const results = []
    while (true) {
        const { projects } = harbor.listProjects({ page, pageSize })

        for (const project of projects) {
            results.push(project)
        }

        if (projects.length == 0 || projects.length < pageSize) {
            break
        }

        if (count > 0 && results.length >= count) {
            break
        }

        page++
    }

    if (count > 0) {
        return results.slice(0, count)
    }

    return results
}

export function fetchRepositories(projectName, count=-1) {
    let page = 1
    const pageSize = 100

    const results = []
    while (true) {
        const { repositories } = harbor.listRepositories(projectName, { page, pageSize })

        for (const repository of repositories) {
            results.push(repository)
        }

        if (repositories.length == 0 || repositories.length < pageSize) {
            break
        }

        if (count > 0 && results.length >= count) {
            break
        }

        page++
    }

    if (count > 0) {
        return results.slice(0, count)
    }

    return results
}

export function fetchUsers(q='', count=-1) {
    let page = 1
    const pageSize = 100

    const results = []
    while (true) {
        const params = { page, pageSize }
        if (q !== '') {
            params.q = q
        }

        const { users } = harbor.listUsers(params)

        for (const user of users) {
            // skip admin
            if (user.username !== 'admin') {
                results.push(user)
            }
        }

        if (users.length == 0 || users.length < pageSize) {
            break
        }

        if (count > 0 && results.length >= count) {
            break
        }

        page++
    }

    if (count > 0) {
        return results.slice(0, count)
    }

    return results
}

export function randomIntBetween(min, max) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
}

export function numberToPadString(num, maxNum, padString='0') {
    return `${num}`.padStart(maxNum.toString().length, padString)
}

export function getProjectName(settings, i) {
    return `${settings.ProjectPrefix}-${numberToPadString(i + 1, settings.ProjectsCount)}`
}

export function getProjectNames(settings) {
    const projectNames = []
    for (let i = 0; i < settings.ProjectsCount; i++) {
        projectNames.push(getProjectName(settings, i))
    }

    return projectNames
}

export function getUsername(settings, i) {
    return `${settings.UserPrefix}-${numberToPadString(i + 1, settings.UsersCount)}`
}

export function getUsernames(settings) {
    const usernames = []
    for (let i = 0; i < settings.UsersCount; i++) {
        usernames.push(getUsername(settings, i))
    }

    return usernames
}

export function getRepositoryName(settings, i) {
    return `repository-${numberToPadString(i + 1, settings.RepositoriesCountPerProject)}`
}

export function getArtifactTag(settings, i) {
    return `v${numberToPadString(i + 1, settings.ArtifactsCountPerRepository)}`
}

export function getArtifactNewTag(settings, tagIndex, newTagIndex) {
    return `${getArtifactTag(settings, tagIndex)}p${numberToPadString(newTagIndex+1, settings.ArtifactTagsCountPerArtifact)}`
}

export function retry(f, opts = {}) {
    var DEFAULT_TIMES = 5

    var options = {
        times: +opts.times || DEFAULT_TIMES,
        intervalFunc: typeof opts.interval === 'function' ? opts.interval : () => (+t.interval || randomIntBetween(1, 5))
    }

    var attempt = 1;

    while (attempt++ < options.times) {
        try {
            return f()
        } catch (e) {
            const delay = options.intervalFunc(attempt)
            if (delay > 0) {
                sleep(d)
            }

            if (attempts >= options.times) {
                throw e
            }
        }
    }
}
